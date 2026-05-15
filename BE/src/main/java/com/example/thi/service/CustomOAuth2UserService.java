package com.example.thi.service;

import com.example.thi.entity.AuthProvider;
import com.example.thi.entity.Profile;
import com.example.thi.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    // Refresh for production build

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println("OAuth2 Login Request detected for provider: " + userRequest.getClientRegistration().getRegistrationId());
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        System.out.println("Attributes from Google: " + attributes);
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = oAuth2User.getName(); // Usually the 'sub' field in Google

        Profile profile = profileRepository.findByEmail(email);
        if (profile == null) {
            profile = new Profile();
            profile.setEmail(email);
            profile.setFullName(name);
            profile.setUsername(email); // Use email as username for social login
            profile.setCreatedAt(LocalDateTime.now());
        }

        profile.setProvider(AuthProvider.GOOGLE);
        profile.setProviderId(providerId);
        profileRepository.save(profile);

        return oAuth2User;
    }
}
