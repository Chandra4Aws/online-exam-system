package com.polymath.onlineexam.dto;

import java.util.List;

public class DashboardDTO {
    private long totalExams;
    private long totalResults;
    private long totalQuestions;
    private List<ActivityDTO> recentActivities;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalExams, long totalResults, long totalQuestions, List<ActivityDTO> recentActivities) {
        this.totalExams = totalExams;
        this.totalResults = totalResults;
        this.totalQuestions = totalQuestions;
        this.recentActivities = recentActivities;
    }

    public static DashboardDTOBuilder builder() {
        return new DashboardDTOBuilder();
    }

    public static class DashboardDTOBuilder {
        private long totalExams;
        private long totalResults;
        private long totalQuestions;
        private List<ActivityDTO> recentActivities;

        public DashboardDTOBuilder totalExams(long totalExams) {
            this.totalExams = totalExams;
            return this;
        }

        public DashboardDTOBuilder totalResults(long totalResults) {
            this.totalResults = totalResults;
            return this;
        }

        public DashboardDTOBuilder totalQuestions(long totalQuestions) {
            this.totalQuestions = totalQuestions;
            return this;
        }

        public DashboardDTOBuilder recentActivities(List<ActivityDTO> recentActivities) {
            this.recentActivities = recentActivities;
            return this;
        }

        public DashboardDTO build() {
            return new DashboardDTO(totalExams, totalResults, totalQuestions, recentActivities);
        }
    }

    // Getters and Setters
    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(long totalResults) {
        this.totalResults = totalResults;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public List<ActivityDTO> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<ActivityDTO> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public static class ActivityDTO {
        private String type;
        private String text;
        private String time;
        private String color;

        public ActivityDTO() {
        }

        public ActivityDTO(String type, String text, String time, String color) {
            this.type = type;
            this.text = text;
            this.time = time;
            this.color = color;
        }

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }
    }
}
