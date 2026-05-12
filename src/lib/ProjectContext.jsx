import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchData = useCallback(async (retries = 2) => {
    try {
      setFetchError(null);
      if (activeUser) {
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', activeUser.id).maybeSingle();
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            role: 'Admin'
          });
        }
      }

      const [
        { data: profilesData, error: e1 },
        { data: projectsData, error: e2 },
        { data: tasksData, error: e3 },
        { data: notificationsData, error: e4 },
        { data: commentsData, error: e5 },
        { data: teamMembersData, error: e6 },
        { data: timeLogsData, error: e7 }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('notifications').select('*').eq('user_id', activeUser.id).order('created_at', { ascending: false }),
        supabase.from('task_comments').select('*, profiles(name, avatar)'),
        supabase.from('team_members').select('*'),
        supabase.from('time_logs').select('*').order('logged_at', { ascending: false })
      ]);

      const firstError = e1 || e2 || e3 || e4 || e5 || e6 || e7;
      if (firstError) throw new Error(firstError.message);

      setMembers(profilesData || []);

      // Each user sees: projects they own OR projects they are a team member of
      const myTeamProjectIds = (teamMembersData || [])
        .filter(tm => tm.member_id === activeUser.id)
        .map(tm => tm.project_id);

      const visibleProjects = (projectsData || []).filter(p =>
        p.owner_id === activeUser.id || myTeamProjectIds.includes(p.id)
      );

      // Attach team member ids to each project
      const projectsWithTeam = visibleProjects.map(p => ({
        ...p,
        title: p.name,
        team: (teamMembersData || []).filter(tm => tm.project_id === p.id).map(tm => tm.member_id)
      }));

      setProjects(projectsWithTeam);

      // Tasks: only tasks belonging to visible projects
      const visibleProjectIds = visibleProjects.map(p => p.id);
      const visibleTasks = (tasksData || []).filter(t => visibleProjectIds.includes(t.project_id));

      const tasksWithComments = visibleTasks.map(task => ({
        ...task,
        projectId: task.project_id,
        assigneeId: task.assignee_id,
        comments: (commentsData || []).filter(c => c.task_id === task.id).map(c => ({
          id: c.id, text: c.text, date: c.created_at, user: c.user_id,
          userName: c.profiles?.name, userAvatar: c.profiles?.avatar
        }))
      }));
      setTasks(tasksWithComments);

      setNotifications((notificationsData || []).map(n => ({
        id: n.id, message: n.message, date: n.created_at, read: n.read
      })));

      setTimeLogs((timeLogsData || []).map(l => ({
        id: l.id,
        taskId: l.task_id,
        userId: l.user_id,
        hours: Number(l.hours),
        note: l.note,
        date: l.logged_at
      })));
    } catch (err) {
      console.error('Error fetching data:', err);
      if (retries > 0) {
        setTimeout(() => fetchData(retries - 1), 2000);
      } else {
        setFetchError(err.message || 'Failed to connect to the server. Check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      setLoading(true);
      fetchData();
    } else {
      setMembers([]);
      setProjects([]);
      setTasks([]);
      setNotifications([]);
      setTimeLogs([]);
      setLoading(false);
    }
  }, [activeUser, fetchData]);

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'inProgress').length,
    overdueTasks: tasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length,
  };

  // Send notification to a specific user (by their user id)
  const sendNotificationToUser = async (userId, message) => {
    await supabase.from('notifications').insert({ user_id: userId, message, read: false });
  };

  const addNotification = async (message) => {
    if (!activeUser) return;
    const newNotif = { user_id: activeUser.id, message, read: false };
    const { data } = await supabase.from('notifications').insert(newNotif).select().single();
    if (data) {
      setNotifications(prev => [{ id: data.id, message: data.message, date: data.created_at, read: data.read }, ...prev]);
    }
  };

  const addTimeLog = async (log) => {
    const { data, error } = await supabase.from('time_logs').insert({
      task_id: log.taskId,
      user_id: log.userId,
      hours: log.hours,
      note: log.note || null
    }).select().single();
    if (error) { console.error('Error adding time log:', error); return; }
    if (data) {
      setTimeLogs(prev => [{
        id: data.id, taskId: data.task_id, userId: data.user_id,
        hours: Number(data.hours), note: data.note, date: data.logged_at
      }, ...prev]);
    }
  };

  const deleteTimeLog = async (logId) => {
    setTimeLogs(prev => prev.filter(l => l.id !== logId));
    await supabase.from('time_logs').delete().eq('id', logId);
  };

  const markNotificationsRead = useCallback(async () => {
    if (!activeUser) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', activeUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [activeUser]);

  // Add member to a project by email — looks up their profile, adds to team_members, notifies them
  const addMember = async (email, projectId) => {
    if (!activeUser || !email || !projectId) return { error: 'Missing required fields.' };

    // Find the profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (profileError || !profile) {
      return { error: 'No user found with that email. They must sign up first.' };
    }

    if (profile.id === activeUser.id) {
      return { error: 'You cannot add yourself as a team member.' };
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('member_id', profile.id)
      .maybeSingle();

    if (existing) {
      return { error: 'This person is already a member of this project.' };
    }

    // Add to team_members
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({ project_id: projectId, member_id: profile.id });

    if (insertError) return { error: insertError.message };

    // Update local project team list
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, team: [...(p.team || []), profile.id] } : p
    ));

    // Add member to local members list if not already there
    setMembers(prev => prev.find(m => m.id === profile.id) ? prev : [...prev, profile]);

    // Notify the added member
    const project = projects.find(p => p.id === projectId);
    await sendNotificationToUser(
      profile.id,
      `You have been added to the project "${project?.title || project?.name}" by ${activeUser.name}.`
    );

    return { success: true, member: profile };
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
    if (error) { console.error('Error adding task:', error); return; }
    if (data) {
      setTasks(prev => [...prev, { ...data, comments: [], projectId: data.project_id, assigneeId: data.assignee_id }]);
      if (data.assignee_id) {
        // Notify the assignee (could be a different user)
        await sendNotificationToUser(data.assignee_id, `New task "${data.title}" has been assigned to you.`);
        // Also add to current user's notifications if they assigned to themselves
        if (data.assignee_id === activeUser.id) {
          addNotification(`New task "${data.title}" assigned.`);
        }
      }
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

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await supabase.from('tasks').update(dbUpdates).eq('id', id);
  };

  const updateTaskStatus = async (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    if (newStatus === 'done') addNotification('Task completed.');
  };

  const assignTask = async (taskId, memberId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigneeId: memberId } : t));
    await supabase.from('tasks').update({ assignee_id: memberId }).eq('id', taskId);
    if (memberId) {
      const task = tasks.find(t => t.id === taskId);
      await sendNotificationToUser(memberId, `Task "${task?.title}" has been assigned to you.`);
    }
    addNotification('Task reassigned.');
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const addTaskComment = async (taskId, text) => {
    if (!activeUser) return;
    const { data } = await supabase.from('task_comments').insert({
      task_id: taskId,
      user_id: activeUser.id,
      text
    }).select('*, profiles(name, avatar)').single();

    if (data) {
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        comments: [...(t.comments || []), {
          id: data.id, user: data.user_id, text: data.text, date: data.created_at,
          userName: data.profiles?.name, userAvatar: data.profiles?.avatar
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

    if (error) { console.error('Error adding project:', error); return; }
    if (data) {
      setProjects(prev => [...prev, { ...data, title: data.name, team: [] }]);
    }
  };

  const updateProject = async (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const dbUpdates = { ...updates };
    if (updates.title) dbUpdates.name = updates.title;
    if (updates.deadline === '') dbUpdates.deadline = null;
    delete dbUpdates.title;
    delete dbUpdates.team;
    await supabase.from('projects').update(dbUpdates).eq('id', id);
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    await supabase.from('projects').delete().eq('id', id);
  };

  const removeMember = async (memberId, projectId) => {
    if (projectId) {
      // Remove from specific project
      await supabase.from('team_members').delete().eq('project_id', projectId).eq('member_id', memberId);
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, team: p.team.filter(id => id !== memberId) } : p
      ));
    } else {
      // Remove from profiles entirely (admin action)
      setMembers(prev => prev.filter(m => m.id !== memberId));
      await supabase.from('profiles').delete().eq('id', memberId);
    }
  };

  const updateMemberRole = async (id, newRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
  };

  return (
    <ProjectContext.Provider value={{
      activeUser, setActiveUser,
      tasks, addTask, updateTask, updateTaskStatus, assignTask, deleteTask, addTaskComment,
      members, addMember, updateMemberRole, removeMember,
      projects, addProject, updateProject, deleteProject,
      notifications, markNotificationsRead,
      timeLogs, addTimeLog, deleteTimeLog,
      stats,
      loading, fetchError,
      retryFetch: () => { setLoading(true); fetchData(); }
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
