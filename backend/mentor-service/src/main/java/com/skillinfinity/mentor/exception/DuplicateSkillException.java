package com.skillinfinity.mentor.exception;

import com.skillinfinity.common.exception.ConflictException;

import java.io.Serial;

public class DuplicateSkillException extends ConflictException {

    @Serial
    private static final long serialVersionUID = 1L;

    public DuplicateSkillException(String skillName) {
        super("Skill '" + skillName + "' already exists for this mentor");
    }
}
