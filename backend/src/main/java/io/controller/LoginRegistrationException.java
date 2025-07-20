package io.controller;

import io.businessLogic.BusinessLogicException;

public class LoginRegistrationException extends BusinessLogicException {
    public LoginRegistrationException(String message) {
        super(message);
    }
}
