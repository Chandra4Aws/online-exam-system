package com.polymath.onlineexam.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.polymath.onlineexam.repository.ResultRepository;
import com.polymath.onlineexam.model.Result;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/recordings")
public class RecordingController {

    private final ResultRepository resultRepository;

    public RecordingController(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @Value("${recordings.storage.path:recordings}")
    private String storagePath;

    /**
     * Upload a proctoring recording for a given exam attempt.
     * The file is stored as:
     *   <storagePath>/<username>/<examId>/<timestamp>.webm
     */
    @PostMapping(value = "/upload/{examId}", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadRecording(
            @PathVariable Long examId,
            @RequestParam("file") MultipartFile file) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = timestamp + ".webm";

        try {
            Path dir = Paths.get(storagePath, username, String.valueOf(examId));
            Files.createDirectories(dir);
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());

            return ResponseEntity.ok(Map.of(
                    "status", "saved",
                    "filename", filename
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/stream/{resultId}")
    public ResponseEntity<Resource> streamRecording(@PathVariable Long resultId) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (result.getRecordingPath() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = Paths.get(storagePath, result.getStudent().getUsername(),
                    String.valueOf(result.getExam().getId()), result.getRecordingPath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("video/webm"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
