package io.businessLogic;

import io.controller.RegistrationRequest;
import io.datarecords.User;
import io.persistence.PersistenceException;
import io.persistence.UserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.mockito.InjectMocks;
import org.mockito.*;

import static org.mockito.Mockito.*;


public class UserLogicTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserLogic userLogic;
    User user = new User("User", "user@gmail.com", false, 0.0, "12345678");


    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }
    @Test
    public void registrationTest() throws BusinessLogicException, PersistenceException {
        doNothing().when(userRepository).addUser(any(User.class));

        userLogic.register(user);

        verify(userRepository, times(1)).addUser(user);
    }

}
