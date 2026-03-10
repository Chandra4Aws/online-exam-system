package com.polymath.onlineexam.service;

import com.polymath.onlineexam.model.Question;
import com.polymath.onlineexam.model.QuestionType;
import com.polymath.onlineexam.repository.QuestionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

@Service
public class QuestionImportService {

    private final QuestionRepository repository;

    public QuestionImportService(QuestionRepository repository) {
        this.repository = repository;
    }

    public List<Question> importQuestions(MultipartFile file) throws IOException {
        List<Question> questions = new ArrayList<>();
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row row = rows.next();
                if (isRowEmpty(row))
                    continue;

                Question question = new Question();
                question.setContent(getCellValue(row.getCell(0)));

                String typeStr = getCellValue(row.getCell(1));
                QuestionType type = QuestionType.valueOf(typeStr.toUpperCase());
                question.setType(type);

                question.setSubject(getCellValue(row.getCell(2)));
                question.setDifficulty(getCellValue(row.getCell(3)));

                List<String> options = new ArrayList<>();
                if (type == QuestionType.MCQ) {
                    for (int i = 4; i <= 7; i++) {
                        String opt = getCellValue(row.getCell(i));
                        if (opt != null && !opt.isEmpty()) {
                            options.add(opt);
                        }
                    }
                } else if (type == QuestionType.TRUE_FALSE) {
                    options = Arrays.asList("True", "False");
                }
                question.setOptions(options);
                question.setCorrectAnswer(getCellValue(row.getCell(8)));

                questions.add(question);
            }
        }
        return repository.saveAll(questions);
    }

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Questions Template");

            Row header = sheet.createRow(0);
            String[] headers = { "Content", "Type (MCQ/TRUE_FALSE)", "Subject", "Difficulty (EASY/MEDIUM/HARD)",
                    "Option A", "Option B", "Option C", "Option D", "Correct Answer" };

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            // Sample data
            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("What is 2+2?");
            row1.createCell(1).setCellValue("MCQ");
            row1.createCell(2).setCellValue("Math");
            row1.createCell(3).setCellValue("EASY");
            row1.createCell(4).setCellValue("3");
            row1.createCell(5).setCellValue("4");
            row1.createCell(6).setCellValue("5");
            row1.createCell(7).setCellValue("6");
            row1.createCell(8).setCellValue("4");

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("Java is a programming language.");
            row2.createCell(1).setCellValue("TRUE_FALSE");
            row2.createCell(2).setCellValue("IT");
            row2.createCell(3).setCellValue("EASY");
            row2.createCell(8).setCellValue("True");

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double val = cell.getNumericCellValue();
                    if (val == (long) val)
                        return String.valueOf((long) val);
                    return String.valueOf(val);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null)
            return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK)
                return false;
        }
        return true;
    }
}
