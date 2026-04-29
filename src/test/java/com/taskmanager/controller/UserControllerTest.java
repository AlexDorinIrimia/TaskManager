package com.taskmanager.controller;

import com.taskmanager.model.User;
import com.taskmanager.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    private UserService userService;
    private UserController userController;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        userController = new UserController(userService);
    }

    @Test
    void testGetAllUsers() {
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");

        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");

        when(userService.getAllUsers()).thenReturn(Arrays.asList(user1, user2));

        List<User> users = userController.getAllUsers();

        assertEquals(2, users.size());
        assertEquals("user1", users.get(0).getUsername());
        verify(userService, times(1)).getAllUsers();
    }

    @Test
    void testGetUserById_Found() {
        User user = new User();
        user.setId(1L);
        user.setUsername("user1");

        when(userService.getUserById(1L)).thenReturn(Optional.of(user));

        ResponseEntity<User> response = userController.getUserById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("user1", response.getBody().getUsername());
        verify(userService, times(1)).getUserById(1L);
    }

    @Test
    void testGetUserById_NotFound() {
        when(userService.getUserById(1L)).thenReturn(Optional.empty());

        ResponseEntity<User> response = userController.getUserById(1L);

        assertEquals(404, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(userService, times(1)).getUserById(1L);
    }

    @Test
    void testRegisterUser_Success() {
        User user = new User();
        user.setUsername("newUser");
        user.setPassword("password");

        when(userService.existsByUsername("newUser")).thenReturn(false);
        when(userService.registerUser(user)).thenReturn(user);

        ResponseEntity<?> response = userController.registerUser(user);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(user, response.getBody());
        verify(userService, times(1)).existsByUsername("newUser");
        verify(userService, times(1)).registerUser(user);
    }

    @Test
    void testRegisterUser_UsernameTaken() {
        User user = new User();
        user.setUsername("existingUser");

        when(userService.existsByUsername("existingUser")).thenReturn(true);

        ResponseEntity<?> response = userController.registerUser(user);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Username already taken", response.getBody());
        verify(userService, times(1)).existsByUsername("existingUser");
        verify(userService, never()).registerUser(any());
    }
}
