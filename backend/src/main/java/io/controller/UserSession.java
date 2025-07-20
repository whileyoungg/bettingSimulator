package io.controller;

public record UserSession(String username, String email, double balance, boolean isVerified) {
}
