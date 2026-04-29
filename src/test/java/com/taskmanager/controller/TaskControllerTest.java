package com.taskmanager.controller;

import com.taskmanager.model.Task;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskControllerTest {

    private TaskService taskService;
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        taskService = mock(TaskService.class);
        taskController = new TaskController(taskService);
    }

    @Test
    void getAllTasks_shouldReturnTasks() {
        Task task = new Task("Test Task", "Desc", LocalDate.now());
        when(taskService.getAllTasks()).thenReturn(List.of(task));

        List<Task> result = taskController.getAllTasks();
        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).getTitle());
    }

    @Test
    void getTaskById_shouldReturnTaskIfExists() {
        Task task = new Task("Task1", "Desc", LocalDate.now());
        when(taskService.getTaskById(1L)).thenReturn(Optional.of(task));

        ResponseEntity<Task> response = taskController.getTaskById(1L);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Task1", response.getBody().getTitle());
    }

    @Test
    void getTaskById_shouldReturnNotFoundIfNotExists() {
        when(taskService.getTaskById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Task> response = taskController.getTaskById(1L);
        assertEquals(404, response.getStatusCode().value());
        assertNull(response.getBody());
    }

    @Test
    void createTask_shouldReturnCreatedTask() {
        Task task = new Task("New Task", "Desc", LocalDate.now());
        when(taskService.createTask(Mockito.any(Task.class), Mockito.eq(1L))).thenReturn(task);

        ResponseEntity<Task> response = taskController.createTask(task, 1L);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("New Task", response.getBody().getTitle());
    }

    @Test
    void updateTask_shouldReturnUpdatedTask() {
        Task updatedTask = new Task("Updated Task", "Updated Desc", LocalDate.now());
        when(taskService.updateTask(1L, updatedTask)).thenReturn(updatedTask);

        ResponseEntity<Task> response = taskController.updateTask(1L, updatedTask);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Updated Task", response.getBody().getTitle());
    }

    @Test
    void deleteTask_shouldReturnOk() {
        doNothing().when(taskService).deleteTask(1L);

        ResponseEntity<?> response = taskController.deleteTask(1L);
        assertEquals(200, response.getStatusCode().value());
        verify(taskService).deleteTask(1L);
    }

    @Test
    void assignUsersToTask_shouldReturnTaskWithAssignedUsers() {
        Task task = new Task("Task", "Desc", LocalDate.now());
        when(taskService.assignUsersToTask(1L, Set.of(1L, 2L))).thenReturn(task);

        ResponseEntity<Task> response = taskController.assignUsersToTask(1L, Set.of(1L, 2L));
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Task", response.getBody().getTitle());
    }
}
