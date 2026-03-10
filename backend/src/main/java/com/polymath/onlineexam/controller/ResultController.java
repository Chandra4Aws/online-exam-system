package com.polymath.onlineexam.controller;

import com.polymath.onlineexam.model.Exam;
import com.polymath.onlineexam.model.Question;
import com.polymath.onlineexam.model.Result;
import com.polymath.onlineexam.model.User;
import com.polymath.onlineexam.repository.ExamRepository;
import com.polymath.onlineexam.repository.ResultRepository;
import com.polymath.onlineexam.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    public ResultController(ResultRepository resultRepository, ExamRepository examRepository,
            UserRepository userRepository) {
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    @PostMapping("/submit/{examId}")
    public ResponseEntity<Result> submitExam(@PathVariable Long examId, @RequestBody com.polymath.onlineexam.dto.SubmissionRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int score = 0;
        List<Question> questions = exam.getQuestions();
        Map<Long, String> answers = request.getAnswers();
        for (Question q : questions) {
            String studentAnswer = answers.get(q.getId());
            if (studentAnswer != null && studentAnswer.equals(q.getCorrectAnswer())) {
                score++;
            }
        }

        Result result = Result.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .totalQuestions(questions.size())
                .submissionDate(LocalDateTime.now())
                .selectedAnswers(answers)
                .recordingPath(request.getRecordingPath())
                .build();

        return ResponseEntity.ok(resultRepository.save(result));
    }

    @GetMapping("/my-results")
    public List<Result> getMyResults() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resultRepository.findByStudent(student);
    }

    @GetMapping("/exam/{examId}")
    public List<Result> getExamResults(@PathVariable Long examId) {
        return resultRepository.findByExamId(examId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result> getResultById(@PathVariable Long id) {
        return resultRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
