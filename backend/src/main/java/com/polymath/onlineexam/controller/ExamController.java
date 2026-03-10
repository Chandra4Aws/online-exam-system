package com.polymath.onlineexam.controller;

import com.polymath.onlineexam.model.Exam;
import com.polymath.onlineexam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamRepository repository;
    private final com.polymath.onlineexam.repository.UserRepository userRepository;

    public ExamController(ExamRepository repository, com.polymath.onlineexam.repository.UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Exam> getAllExams() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getRole() == com.polymath.onlineexam.model.Role.STUDENT) {
                        return repository.findByPublishedTrue();
                    }
                    return repository.findAll();
                })
                .orElseGet(repository::findAll);
    }

    @PostMapping
    public Exam createExam(@RequestBody Exam exam) {
        return repository.save(exam);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam examDetails) {
        return repository.findById(id)
                .map(exam -> {
                    exam.setTitle(examDetails.getTitle());
                    exam.setDescription(examDetails.getDescription());
                    exam.setDurationMinutes(examDetails.getDurationMinutes());
                    exam.setQuestions(examDetails.getQuestions());
                    exam.setPublished(examDetails.isPublished());
                    return ResponseEntity.ok(repository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Exam> publishExam(@PathVariable Long id) {
        return repository.findById(id)
                .map(exam -> {
                    exam.setPublished(true);
                    return ResponseEntity.ok(repository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        return repository.findById(id)
                .map(exam -> {
                    repository.delete(exam);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
