package com.polymath.onlineexam.dto;

import java.util.Map;

public class SubmissionRequest {
    private Map<Long, String> answers;
    private String recordingPath;

    public SubmissionRequest() {
    }

    public SubmissionRequest(Map<Long, String> answers, String recordingPath) {
        this.answers = answers;
        this.recordingPath = recordingPath;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }

    public String getRecordingPath() {
        return recordingPath;
    }

    public void setRecordingPath(String recordingPath) {
        this.recordingPath = recordingPath;
    }
}
