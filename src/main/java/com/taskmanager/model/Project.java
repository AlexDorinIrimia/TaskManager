package com.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToMany
    @JoinTable(
            name = "project_users",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    // Don't serialize users' projects back — breaks circular ref
    @JsonIgnoreProperties({"projects", "tasks", "password"})
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    // When serializing a Project, don't include full Task objects (only ids needed)
    // This prevents Project → Task → Project → Task... infinite loop
    @JsonIgnoreProperties({"project", "assignedUsers"})
    private Set<Task> tasks = new HashSet<>();

    public Project() {}

    public Project(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }

    public Set<Task> getTasks() { return tasks; }
    public void setTasks(Set<Task> tasks) { this.tasks = tasks; }
}
