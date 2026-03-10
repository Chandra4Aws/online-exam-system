package com.polymath.onlineexam.controller;

import com.polymath.onlineexam.model.Question;
import com.polymath.onlineexam.repository.QuestionRepository;
import com.polymath.onlineexam.service.QuestionImportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository repository;
    private final QuestionImportService importService;

    public QuestionController(QuestionRepository repository, QuestionImportService importService) {
        this.repository = repository;
        this.importService = importService;
    }

    @GetMapping
    public List<Question> getAllQuestions() {
        return repository.findAll();
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return repository.save(question);
    }

    @PostMapping("/import")
    public ResponseEntity<List<Question>> importQuestions(@RequestParam("file") MultipartFile file) {
        try {
            List<Question> questions = importService.importQuestions(file);
            return ResponseEntity.ok(questions);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] template = importService.generateTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=questions_template.xlsx")
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        return repository.findById(id)
                .map(question -> {
                    question.setContent(questionDetails.getContent());
                    question.setType(questionDetails.getType());
                    question.setOptions(questionDetails.getOptions());
                    question.setCorrectAnswer(questionDetails.getCorrectAnswer());
                    question.setSubject(questionDetails.getSubject());
                    question.setDifficulty(questionDetails.getDifficulty());
                    return ResponseEntity.ok(repository.save(question));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        return repository.findById(id)
                .map(question -> {
                    repository.delete(question);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
