package com.polymath.onlineexam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User student;

    @ManyToOne
    private Exam exam;

    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime submissionDate;

    @ElementCollection
    private Map<Long, String> selectedAnswers;

    private String recordingPath;

    public Result() {
    }

    public Result(User student, Exam exam, Integer score, Integer totalQuestions, LocalDateTime submissionDate,
            Map<Long, String> selectedAnswers, String recordingPath) {
        this.student = student;
        this.exam = exam;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.submissionDate = submissionDate;
        this.selectedAnswers = selectedAnswers;
        this.recordingPath = recordingPath;
    }

    public static ResultBuilder builder() {
        return new ResultBuilder();
    }

    public static class ResultBuilder {
        private User student;
        private Exam exam;
        private Integer score;
        private Integer totalQuestions;
        private LocalDateTime submissionDate;
        private Map<Long, String> selectedAnswers;
        private String recordingPath;

        public ResultBuilder student(User student) {
            this.student = student;
            return this;
        }

        public ResultBuilder exam(Exam exam) {
            this.exam = exam;
            return this;
        }

        public ResultBuilder score(Integer score) {
            this.score = score;
            return this;
        }

        public ResultBuilder totalQuestions(Integer totalQuestions) {
            this.totalQuestions = totalQuestions;
            return this;
        }

        public ResultBuilder submissionDate(LocalDateTime submissionDate) {
            this.submissionDate = submissionDate;
            return this;
        }

        public ResultBuilder selectedAnswers(Map<Long, String> selectedAnswers) {
            this.selectedAnswers = selectedAnswers;
            return this;
        }

        public ResultBuilder recordingPath(String recordingPath) {
            this.recordingPath = recordingPath;
            return this;
        }

        public Result build() {
            return new Result(student, exam, score, totalQuestions, submissionDate, selectedAnswers, recordingPath);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Map<Long, String> getSelectedAnswers() {
        return selectedAnswers;
    }

    public void setSelectedAnswers(Map<Long, String> selectedAnswers) {
        this.selectedAnswers = selectedAnswers;
    }

    public String getRecordingPath() {
        return recordingPath;
    }

    public void setRecordingPath(String recordingPath) {
        this.recordingPath = recordingPath;
    }
}
