package com.example.thi.service.impl;

import com.example.thi.entity.Profile;
import com.example.thi.repository.ProfileRepository;
import com.example.thi.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    @Override
    public Profile getProfileById(UUID id) {
        return profileRepository.findById(id).orElse(null);
    }

    @Override
    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    @Override
    public Profile updateProfile(UUID id, Profile profile) {
        Profile existing = getProfileById(id);
        if (existing != null) {
            profile.setId(id);
            return profileRepository.save(profile);
        }
        return null;
    }

    @Override
    public void deleteProfile(UUID id) {
        profileRepository.deleteById(id);
    }
}
