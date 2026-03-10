package com.polymath.onlineexam.repository;

import com.polymath.onlineexam.model.Result;
import com.polymath.onlineexam.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudent(User student);

    List<Result> findByExamId(Long examId);

    List<Result> findTop5ByOrderBySubmissionDateDesc();

    List<Result> findTop5ByStudentOrderBySubmissionDateDesc(User student);
}
