package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void getAllTasks_shouldReturnListOfTasks() {
        Task t1 = new Task("Task 1", "Desc 1", LocalDate.now());
        Task t2 = new Task("Task 2", "Desc 2", LocalDate.now());
        when(taskRepository.findAll()).thenReturn(Arrays.asList(t1, t2));

        List<Task> result = taskService.getAllTasks();

        assertEquals(2, result.size());
        verify(taskRepository).findAll();
    }

    @Test
    void getTaskById_shouldReturnTaskIfExists() {
        Task task = new Task("Task 1", "Desc 1", LocalDate.now());
        task.setId(1L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        Optional<Task> result = taskService.getTaskById(1L);

        assertTrue(result.isPresent());
        assertEquals("Task 1", result.get().getTitle());
        verify(taskRepository).findById(1L);
    }

    @Test
    void getTaskById_shouldReturnEmptyIfNotExists() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Task> result = taskService.getTaskById(99L);

        assertFalse(result.isPresent());
        verify(taskRepository).findById(99L);
    }

    @Test
    void getTasksByProjectId_shouldReturnTasks() {
        Task t1 = new Task("Task 1", "Desc 1", LocalDate.now());
        Task t2 = new Task("Task 2", "Desc 2", LocalDate.now());
        when(taskRepository.findByProjectId(1L)).thenReturn(Arrays.asList(t1, t2));

        List<Task> result = taskService.getTasksByProjectId(1L);

        assertEquals(2, result.size());
        verify(taskRepository).findByProjectId(1L);
    }

    @Test
    void createTask_shouldSaveTaskWithProject() {
        Project project = new Project("Project A", "Desc A");
        Task task = new Task("Task 1", "Desc 1", LocalDate.now());

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(taskRepository.save(task)).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.createTask(task, 1L);

        assertEquals(project, result.getProject());
        verify(taskRepository).save(task);
    }

    @Test
    void createTask_shouldThrowIfProjectNotFound() {
        Task task = new Task("Task 1", "Desc 1", LocalDate.now());

        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> taskService.createTask(task, 1L));

        assertEquals("Project not found", ex.getMessage());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_shouldUpdateAndSaveIfExists() {
        Task existing = new Task("Old Task", "Old Desc", LocalDate.now());
        existing.setId(1L);
        existing.setStatus(Task.Status.TODO);

        Task updated = new Task("New Task", "New Desc", LocalDate.now().plusDays(1));
        updated.setStatus(Task.Status.IN_PROGRESS);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.updateTask(1L, updated);

        assertEquals("New Task", result.getTitle());
        assertEquals("New Desc", result.getDescription());
        assertEquals(Task.Status.IN_PROGRESS, result.getStatus());
        assertEquals(updated.getDeadline(), result.getDeadline());
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(existing);
    }

    @Test
    void updateTask_shouldThrowIfNotFound() {
        Task updated = new Task("New Task", "New Desc", LocalDate.now());

        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> taskService.updateTask(1L, updated));

        assertEquals("Task not found", ex.getMessage());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void deleteTask_shouldCallRepositoryDeleteById() {
        taskService.deleteTask(1L);

        verify(taskRepository).deleteById(1L);
    }

    @Test
    void assignUsersToTask_shouldAddUsersAndSave() {
        Task task = new Task("Task 1", "Desc 1", LocalDate.now());
        task.setAssignedUsers(new HashSet<>());

        User u1 = new User("john", "pwd", "John");
        User u2 = new User("alice", "pwd", "Alice");

        Set<Long> userIds = Set.of(1L, 2L);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(userRepository.findAllById(userIds)).thenReturn(Arrays.asList(u1, u2));
        when(taskRepository.save(task)).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.assignUsersToTask(1L, userIds);

        assertEquals(2, result.getAssignedUsers().size());
        assertTrue(result.getAssignedUsers().contains(u1));
        assertTrue(result.getAssignedUsers().contains(u2));
        verify(taskRepository).save(task);
    }

    @Test
    void assignUsersToTask_shouldThrowIfTaskNotFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> taskService.assignUsersToTask(99L, Set.of(1L)));

        assertEquals("Task not found", ex.getMessage());
        verify(userRepository, never()).findAllById(any());
        verify(taskRepository, never()).save(any());
    }
}
