package com.polymath.onlineexam.service;

import com.polymath.onlineexam.model.Question;
import com.polymath.onlineexam.model.QuestionType;
import com.polymath.onlineexam.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class QuestionImportServiceTest {

    @Mock
    private QuestionRepository repository;

    @InjectMocks
    private QuestionImportService importService;

    @Test
    public void testGenerateTemplate() throws IOException {
        byte[] template = importService.generateTemplate();
        assertNotNull(template);
        assertTrue(template.length > 0);
    }

    @Test
    public void testImportQuestions() throws IOException {
        // Since it's hard to mock the Excel file structure here without POI code in the
        // test,
        // we can at least verify if the import method handles a basic (though
        // empty/invalid) file
        // or we could use the generated template to test import.

        byte[] template = importService.generateTemplate();
        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", template);

        when(repository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Question> imported = importService.importQuestions(file);

        // The template has 2 sample questions
        assertEquals(2, imported.size());

        Question q1 = imported.get(0);
        assertEquals("What is 2+2?", q1.getContent());
        assertEquals(QuestionType.MCQ, q1.getType());
        assertEquals("Math", q1.getSubject());
        assertEquals("EASY", q1.getDifficulty());
        assertEquals(4, q1.getOptions().size());
        assertEquals("4", q1.getCorrectAnswer());

        Question q2 = imported.get(1);
        assertEquals("Java is a programming language.", q2.getContent());
        assertEquals(QuestionType.TRUE_FALSE, q2.getType());
        assertEquals("True", q2.getCorrectAnswer());
        assertEquals(2, q2.getOptions().size());
    }
}
