package com.example.thi.controller;

import com.example.thi.entity.Profile;
import com.example.thi.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin("*")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<List<Profile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profile> getProfileById(@PathVariable UUID id) {
        Profile profile = profileService.getProfileById(id);
        return profile != null ? ResponseEntity.ok(profile) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Profile> createProfile(@RequestBody Profile profile) {
        return ResponseEntity.ok(profileService.createProfile(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profile> updateProfile(@PathVariable UUID id, @RequestBody Profile profile) {
        Profile updated = profileService.updateProfile(id, profile);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
