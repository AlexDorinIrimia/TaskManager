package com.taskmanager.service;

import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        userService = new UserService();
        userService.userRepository = userRepository;
        userService.passwordEncoder = passwordEncoder;
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() {
        User user1 = new User("john", "1234", "John Doe");
        User user2 = new User("alice", "abcd", "Alice Smith");
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        List<User> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals("john", result.get(0).getUsername());
        assertEquals("alice", result.get(1).getUsername());
        verify(userRepository).findAll();
    }

    @Test
    void getUserById_shouldReturnUserIfExists() {
        User user = new User("john", "1234", "John Doe");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("john", result.get().getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_shouldReturnEmptyIfNotExists() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById(99L);

        assertFalse(result.isPresent());
        verify(userRepository).findById(99L);
    }

    @Test
    void getUserByUsername_shouldReturnUserIfExists() {
        User user = new User("john", "1234", "John Doe");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserByUsername("john");

        assertTrue(result.isPresent());
        assertEquals("john", result.get().getUsername());
        verify(userRepository).findByUsername("john");
    }

    @Test
    void getUserByUsername_shouldReturnEmptyIfNotExists() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserByUsername("unknown");

        assertFalse(result.isPresent());
        verify(userRepository).findByUsername("unknown");
    }

    @Test
    void existsByUsername_shouldReturnTrueIfExists() {
        when(userRepository.existsByUsername("john")).thenReturn(true);

        boolean exists = userService.existsByUsername("john");

        assertTrue(exists);
        verify(userRepository).existsByUsername("john");
    }

    @Test
    void existsByUsername_shouldReturnFalseIfNotExists() {
        when(userRepository.existsByUsername("unknown")).thenReturn(false);

        boolean exists = userService.existsByUsername("unknown");

        assertFalse(exists);
        verify(userRepository).existsByUsername("unknown");
    }

    @Test
    void registerUser_shouldEncryptPasswordAndSaveUser() {
        User user = new User("john", "1234", "John Doe");

        when(passwordEncoder.encode("1234")).thenReturn("encrypted");
        when(userRepository.save(Mockito.any(User.class))).thenAnswer(i -> i.getArgument(0));

        User savedUser = userService.registerUser(user);

        assertEquals("john", savedUser.getUsername());
        assertEquals("encrypted", savedUser.getPassword());
        verify(passwordEncoder).encode("1234");
        verify(userRepository).save(savedUser);
    }

    @Test
    void deleteUser_shouldCallRepositoryDeleteById() {
        Long id = 1L;

        userService.deleteUser(id);

        verify(userRepository).deleteById(id);
    }
}
