package com.example.thi.controller;

import com.example.thi.dto.LoginRequest;
import com.example.thi.entity.Profile;
import com.example.thi.entity.UserRole;
import com.example.thi.repository.ProfileRepository;
import com.example.thi.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Profile p = profileRepository.findByUsername(req.getUsername());
        if (p != null && p.getPassword() != null && p.getPassword().equals(req.getPassword())) {
            String role = "customer";
            List<UserRole> roles = userRoleRepository.findAll().stream()
                    .filter(r -> r.getUserId() != null && r.getUserId().equals(p.getId()))
                    .collect(Collectors.toList());
            if (!roles.isEmpty()) {
                role = roles.get(0).getRole();
            }

            Map<String, Object> res = new HashMap<>();
            res.put("id", p.getId());
            res.put("username", p.getUsername());
            res.put("fullName", p.getFullName());
            res.put("role", role);
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.status(401).body("Tài khoản hoặc mật khẩu không đúng");
    }
}
