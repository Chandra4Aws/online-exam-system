package com.polymath.onlineexam.controller;

import com.polymath.onlineexam.dto.DashboardDTO;
import com.polymath.onlineexam.model.Result;
import com.polymath.onlineexam.model.User;
import com.polymath.onlineexam.repository.ExamRepository;
import com.polymath.onlineexam.repository.QuestionRepository;
import com.polymath.onlineexam.repository.ResultRepository;
import com.polymath.onlineexam.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

        private final ExamRepository examRepository;
        private final QuestionRepository questionRepository;
        private final ResultRepository resultRepository;
        private final UserRepository userRepository;

        public DashboardController(ExamRepository examRepository, QuestionRepository questionRepository,
                        ResultRepository resultRepository, UserRepository userRepository) {
                this.examRepository = examRepository;
                this.questionRepository = questionRepository;
                this.resultRepository = resultRepository;
                this.userRepository = userRepository;
        }

        @GetMapping("/stats")
        public DashboardDTO getStats() {
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()
                                || "anonymousUser".equals(authentication.getName())) {
                        // Return empty stats instead of throwing exception if unauthenticated
                        return DashboardDTO.builder()
                                        .totalExams(0)
                                        .totalResults(0)
                                        .totalQuestions(0)
                                        .recentActivities(List.of(new DashboardDTO.ActivityDTO(
                                                        "INFO",
                                                        "Please login to see stats",
                                                        "now",
                                                        "#94a3b8")))
                                        .build();
                }

                String username = authentication.getName();
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean isStudent = user.getRole().name().equals("STUDENT");

                DashboardDTO.DashboardDTOBuilder builder = DashboardDTO.builder();

                if (isStudent) {
                        builder.totalExams(examRepository.findByPublishedTrue().size());
                        builder.totalResults(resultRepository.findByStudent(user).size());
                        builder.totalQuestions(0); // Not relevant for students

                        List<Result> recentResults = resultRepository.findTop5ByStudentOrderBySubmissionDateDesc(user);
                        builder.recentActivities(recentResults.stream().map(r -> new DashboardDTO.ActivityDTO(
                                        "EXAM_SUBMITTED",
                                        "You submitted " + r.getExam().getTitle(),
                                        r.getSubmissionDate() != null ? r.getSubmissionDate().format(DateTimeFormatter.ofPattern("MMM dd, HH:mm")) : "recently",
                                        "#6366f1")).collect(Collectors.toList()));
                } else {
                        builder.totalExams(examRepository.count());
                        builder.totalResults(resultRepository.count());
                        builder.totalQuestions(questionRepository.count());
 
                        List<Result> recentResults = resultRepository.findTop5ByOrderBySubmissionDateDesc();
                        builder.recentActivities(recentResults.stream().map(r -> new DashboardDTO.ActivityDTO(
                                        "EXAM_SUBMITTED",
                                        r.getStudent().getUsername() + " submitted " + r.getExam().getTitle(),
                                        r.getSubmissionDate() != null ? r.getSubmissionDate().format(DateTimeFormatter.ofPattern("MMM dd, HH:mm")) : "recently",
                                        "#10b981")).collect(Collectors.toList()));
                }

                DashboardDTO dto = builder.build();
                if (dto.getRecentActivities().isEmpty()) {
                        dto.setRecentActivities(List.of(
                                        new DashboardDTO.ActivityDTO("INFO", "No recent activity yet", "now",
                                                        "#94a3b8")));
                }

                return dto;
        }
}
