package com.example.thi.service;

import com.example.thi.entity.Profile;
import java.util.List;
import java.util.UUID;

public interface ProfileService {
    List<Profile> getAllProfiles();
    Profile getProfileById(UUID id);
    Profile createProfile(Profile profile);
    Profile updateProfile(UUID id, Profile profile);
    void deleteProfile(UUID id);
}
