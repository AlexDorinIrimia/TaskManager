package com.taskmanager.controller;

import com.taskmanager.model.Project;
import com.taskmanager.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectControllerTest {

    private ProjectService projectService;
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        projectService = mock(ProjectService.class);
        projectController = new ProjectController(projectService);
    }

    @Test
    void testGetAllProjects() {
        Project p1 = new Project();
        p1.setId(1L);
        p1.setName("Project 1");

        Project p2 = new Project();
        p2.setId(2L);
        p2.setName("Project 2");

        when(projectService.getAllProjects()).thenReturn(Arrays.asList(p1, p2));

        List<Project> projects = projectController.getAllProjects();

        assertEquals(2, projects.size());
        assertEquals("Project 1", projects.get(0).getName());
        verify(projectService, times(1)).getAllProjects();
    }

    @Test
    void testGetProjectById_Found() {
        Project project = new Project();
        project.setId(1L);
        project.setName("Project 1");

        when(projectService.getProjectById(1L)).thenReturn(Optional.of(project));

        ResponseEntity<Project> response = projectController.getProjectById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Project 1", response.getBody().getName());
        verify(projectService, times(1)).getProjectById(1L);
    }

    @Test
    void testGetProjectById_NotFound() {
        when(projectService.getProjectById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Project> response = projectController.getProjectById(1L);

        assertEquals(404, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(projectService, times(1)).getProjectById(1L);
    }

    @Test
    void testCreateProject() {
        Project project = new Project();
        project.setName("New Project");

        when(projectService.createProject(project)).thenReturn(project);

        ResponseEntity<Project> response = projectController.createProject(project);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(project, response.getBody());
        verify(projectService, times(1)).createProject(project);
    }

    @Test
    void testUpdateProject() {
        Project project = new Project();
        project.setName("Updated Project");

        when(projectService.updateProject(1L, project)).thenReturn(project);

        ResponseEntity<Project> response = projectController.updateProject(1L, project);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(project, response.getBody());
        verify(projectService, times(1)).updateProject(1L, project);
    }

    @Test
    void testDeleteProject() {
        doNothing().when(projectService).deleteProject(1L);

        ResponseEntity<?> response = projectController.deleteProject(1L);

        assertEquals(200, response.getStatusCode().value());
        verify(projectService, times(1)).deleteProject(1L);
    }

    @Test
    void testAssignUsersToProject() {
        Set<Long> userIds = new HashSet<>();
        userIds.add(1L);
        userIds.add(2L);

        Project project = new Project();
        project.setId(1L);

        when(projectService.assignUsersToProject(1L, userIds)).thenReturn(project);

        ResponseEntity<Project> response = projectController.assignUsersToProject(1L, userIds);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(project, response.getBody());
        verify(projectService, times(1)).assignUsersToProject(1L, userIds);
    }
}
