package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void getAllProjects_shouldReturnListOfProjects() {
        Project p1 = new Project("Project A", "Desc A");
        Project p2 = new Project("Project B", "Desc B");
        when(projectRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<Project> result = projectService.getAllProjects();

        assertEquals(2, result.size());
        assertEquals("Project A", result.get(0).getName());
        verify(projectRepository).findAll();
    }

    @Test
    void getProjectById_shouldReturnProjectIfExists() {
        Project project = new Project("Project A", "Desc A");
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        Optional<Project> result = projectService.getProjectById(1L);

        assertTrue(result.isPresent());
        assertEquals("Project A", result.get().getName());
        verify(projectRepository).findById(1L);
    }

    @Test
    void getProjectById_shouldReturnEmptyIfNotExists() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Project> result = projectService.getProjectById(99L);

        assertFalse(result.isPresent());
        verify(projectRepository).findById(99L);
    }

    @Test
    void createProject_shouldSaveProject() {
        Project project = new Project("Project A", "Desc A");
        when(projectRepository.save(project)).thenReturn(project);

        Project result = projectService.createProject(project);

        assertEquals("Project A", result.getName());
        verify(projectRepository).save(project);
    }

    @Test
    void updateProject_shouldUpdateAndSaveIfExists() {
        Project existing = new Project("Old Name", "Old Desc");
        Project updated = new Project("New Name", "New Desc");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(projectRepository.save(existing)).thenReturn(existing);

        Project result = projectService.updateProject(1L, updated);

        assertEquals("New Name", result.getName());
        assertEquals("New Desc", result.getDescription());
        verify(projectRepository).save(existing);
    }

    @Test
    void updateProject_shouldThrowIfNotFound() {
        Project updated = new Project("New Name", "New Desc");

        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> projectService.updateProject(1L, updated));

        assertEquals("Project not found", ex.getMessage());
        verify(projectRepository, never()).save(any());
    }

    @Test
    void deleteProject_shouldCallRepositoryDeleteById() {
        projectService.deleteProject(1L);

        verify(projectRepository).deleteById(1L);
    }

    @Test
    void assignUsersToProject_shouldAddUsersAndSave() {
        Project project = new Project("Project A", "Desc A");
        project.setMembers(new HashSet<>());

        User u1 = new User("john", "pwd", "John");
        User u2 = new User("alice", "pwd", "Alice");

        Set<Long> userIds = Set.of(1L, 2L);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findAllById(userIds)).thenReturn(Arrays.asList(u1, u2));
        when(projectRepository.save(project)).thenReturn(project);

        Project result = projectService.assignUsersToProject(1L, userIds);

        assertEquals(2, result.getMembers().size());
        assertTrue(result.getMembers().contains(u1));
        assertTrue(result.getMembers().contains(u2));
        verify(projectRepository).save(project);
    }

    @Test
    void assignUsersToProject_shouldThrowIfProjectNotFound() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> projectService.assignUsersToProject(99L, Set.of(1L)));

        assertEquals("Project not found", ex.getMessage());
        verify(userRepository, never()).findAllById(any());
        verify(projectRepository, never()).save(any());
    }
}
