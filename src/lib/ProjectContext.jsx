import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabase';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (activeUser) {
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', activeUser.id).maybeSingle();
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            avatar: activeUser.avatar,
            role: 'Admin'
          });
        }
      }

      const [
        { data: profilesData },
        { data: projectsData },
        { data: tasksData },
        { data: notificationsData },
        { data: commentsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('task_comments').select('*, profiles(name, avatar)')
      ]);

      setMembers(profilesData || []);
      const projectsWithAdapter = (projectsData || []).map(p => ({
        ...p,
        title: p.name,
        team: [] // Add empty team array to prevent frontend crash
      }));
      setProjects(projectsWithAdapter);
      
      const tasksWithComments = (tasksData || []).map(task => ({
        ...task,
        projectId: task.project_id,
        assigneeId: task.assignee_id,
        comments: (commentsData || []).filter(c => c.task_id === task.id).map(c => ({
           id: c.id,
           text: c.text,
           date: c.created_at,
           user: c.user_id,
           userName: c.profiles?.name,
           userAvatar: c.profiles?.avatar
        }))
      }));
      setTasks(tasksWithComments);
      
      setNotifications((notificationsData || []).map(n => ({
        id: n.id,
        message: n.message,
        date: n.created_at,
        read: n.read
      })));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeUser) {
      setLoading(true);
      fetchData();
    } else {
      setMembers([]);
      setProjects([]);
      setTasks([]);
      setNotifications([]);
    }
  }, [activeUser]);

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'inProgress').length,
    overdueTasks: tasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length,
  };

  const addNotification = async (message) => {
    if (!activeUser) return;
    const newNotif = { user_id: activeUser.id, message, read: false };
    const { data } = await supabase.from('notifications').insert(newNotif).select().single();
    if (data) {
      setNotifications(prev => [{ id: data.id, message: data.message, date: data.created_at, read: data.read }, ...prev]);
    }
  };

  const markNotificationsRead = async () => {
    if (!activeUser) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', activeUser.id);
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const addTask = async (task) => {
    const newTask = {
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status || 'todo',
      priority: task.priority || 'Medium',
      deadline: task.deadline || null,
      assignee_id: task.assigneeId || null
    };
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    if (error) {
       console.error("Error adding task:", error);
       alert("Database Error (Task): " + error.message + " | Details: " + JSON.stringify(error));
       return;
    }
    if (data && !error) {
      setTasks([...tasks, { ...data, comments: [], projectId: data.project_id, assigneeId: data.assignee_id }]);
      if (data.assignee_id) addNotification(`New task "${data.title}" assigned.`);
    }
  };

  const updateTask = async (id, updates) => {
    const dbUpdates = {};
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId || null;

    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t)); 
    await supabase.from('tasks').update(dbUpdates).eq('id', id);
  };

  const updateTaskStatus = async (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)); 
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    if (newStatus === 'done') addNotification(`Task completed.`);
  };

  const assignTask = async (taskId, memberId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assigneeId: memberId } : t)); 
    await supabase.from('tasks').update({ assignee_id: memberId }).eq('id', taskId);
    addNotification(`Task reassigned.`);
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t.id !== id)); 
    await supabase.from('tasks').delete().eq('id', id);
  };

  const addTaskComment = async (taskId, text) => {
    if (!activeUser) return;
    const { data } = await supabase.from('task_comments').insert({
      task_id: taskId,
      user_id: activeUser.id,
      text: text
    }).select('*, profiles(name, avatar)').single();

    if (data) {
      setTasks(tasks.map(t => t.id === taskId ? { 
        ...t, 
        comments: [...(t.comments || []), { 
          id: data.id, 
          user: data.user_id, 
          text: data.text, 
          date: data.created_at,
          userName: data.profiles?.name,
          userAvatar: data.profiles?.avatar
        }] 
      } : t));
    }
  };

  const addProject = async (project) => {
    if (!activeUser) return;
    const { data, error } = await supabase.from('projects').insert({
      name: project.title || project.name,
      description: project.description,
      status: project.status || 'Active',
      deadline: project.deadline || null,
      owner_id: activeUser.id
    }).select().single();
    
    if (error) {
      console.error("Error adding project:", error);
      alert("Database Error (Project): " + error.message + " | Details: " + JSON.stringify(error));
      return;
    }
    
    if (data) {
      setProjects([...projects, { ...data, title: data.name, team: [] }]);
    }
  };

  const updateProject = async (id, updates) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p)); 
    const dbUpdates = { ...updates };
    if (updates.title) dbUpdates.name = updates.title;
    if (updates.deadline === '') dbUpdates.deadline = null;
    delete dbUpdates.title;
    delete dbUpdates.team;
    
    await supabase.from('projects').update(dbUpdates).eq('id', id);
  };

  const deleteProject = async (id) => {
    setProjects(projects.filter(p => p.id !== id));
    setTasks(tasks.filter(t => t.project_id !== id && t.projectId !== id)); 
    await supabase.from('projects').delete().eq('id', id);
  };

  const addMember = async (member) => {
    alert('To add a new team member, they must sign up for an account via the Login/Signup page first. Supabase Auth safely handles user creation.');
  };

  const updateMemberRole = async (id, newRole) => {
    setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
  };

  const removeMember = async (id) => {
    setMembers(members.filter(m => m.id !== id));
    await supabase.from('profiles').delete().eq('id', id);
  };

  return (
    <ProjectContext.Provider value={{
      activeUser, setActiveUser,
      tasks, addTask, updateTask, updateTaskStatus, assignTask, deleteTask, addTaskComment,
      members, addMember, updateMemberRole, removeMember,
      projects, addProject, updateProject, deleteProject,
      notifications, markNotificationsRead,
      stats,
      loading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
