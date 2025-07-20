package io.controller;

import io.businessLogic.*;
import io.controller.RegistrationRequest;
import io.datarecords.Action;
import io.datarecords.Event;
import io.datarecords.User;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.*;

public class ControllerTest {
    User dummyUser = new User(
            "johnDoe",
            "john@example.com",
            false,
            100.0,
            "hashedPassword"
    );

    Event dummyEvent = new Event(
            "Summer Tournament",
            1,
            5000.0,
            100.0,
            10,
            true,
            false,
            true,
            "johnDoe",
            null,
            5000.0,
            LocalDateTime.now(),
            null,
            List.of()
    );
    Action dummyAction = new Action(
            101,
            "Team A Wins",
            2.5,
            dummyEvent
    );
    Action dummyAction2 = new Action(
            102,
            "Team B Wins",
            2.1,
            dummyEvent
    );
    @Mock
    private Logic logic;

    @Mock
    private UserLogic userLogic;
    @Mock
    private EventLogic eventLogic;

    @Mock
    private ParticipationLogic participationLogic;

    @InjectMocks
    private Controller controller = new Controller(logic);


    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        when(logic.getUserLogic()).thenReturn(userLogic);
        when(logic.getEventLogic()).thenReturn(eventLogic);
        when(logic.getParticipationLogic()).thenReturn(participationLogic);
    }


    @Test
    public void registerTest() throws BusinessLogicException {
        RegistrationRequest request = new RegistrationRequest("johnDoe", "john@example.com", "password123");
        User user = new User("johnDoe", "john@example.com", false, 0.0, "password123");
        when(userLogic.uniqueUsername("johnDoe")).thenReturn(true);
        doNothing().when(userLogic).register(any(User.class));
        when(userLogic.findByUsername("johnDoe")).thenReturn(user);
        User result = controller.register(request);
        SoftAssertions.assertSoftly(softly -> {
            assertThat(result).isNotNull();
            assertThat(result.username()).isEqualTo("johnDoe");
            assertThat(result.email()).isEqualTo("john@example.com");
            assertThat(result.password()).isEqualTo("password123");
        });
        verify(userLogic).register(any(User.class));
        verify(userLogic).findByUsername("johnDoe");
    }
    @Test
    public void invalidRequestTest_01() throws BusinessLogicException {
        RegistrationRequest request = new RegistrationRequest("john", "john@example.com", "pa123");
        User user = new User("john", "john@example.com", false, 0.0, request.password());
        when(userLogic.uniqueUsername("john")).thenReturn(true);
        doNothing().when(userLogic).register(any(User.class));
        assertThrows(BusinessLogicException.class, () -> controller.register(request));
    }
    @Test
    public void invalidRequestTest_02() throws BusinessLogicException {
        RegistrationRequest request = new RegistrationRequest("john", "johnxample.com", "password123");
        User user = new User(request.username(), request.email(), false, 0.0, request.password());
        when(userLogic.uniqueUsername("john")).thenReturn(true);
        doNothing().when(userLogic).register(any(User.class));
        assertThrows(BusinessLogicException.class, () -> controller.register(request));
    }
    @Test
    public void invalidRequestTest_03() throws BusinessLogicException {
        RegistrationRequest request = new RegistrationRequest("johnDoe", "john@example.com", "password123");
        User user = new User(request.username(), request.email(), false, 0.0, request.password());
        when(userLogic.uniqueUsername("johnDoe")).thenReturn(true);
        doNothing().when(userLogic).register(any(User.class));
        controller.register(request);
        RegistrationRequest request2 = new RegistrationRequest("johnDoe", "john@example.com", "password123");
        User user2 = new User(request2.username(), request2.email(), false, 0.0, request2.password());
        when(userLogic.uniqueUsername("johnDoe")).thenReturn(false);
        assertThrows(BusinessLogicException.class, () -> controller.register(request2));
    }
    @Test
    public void getUsers_returnsListOfUsers() throws BusinessLogicException {
        List<User> users = List.of(
                new User("user1", "user1@example.com", false, 0.0, "pass1"),
                new User("user2", "user2@example.com", false, 10.0, "pass2")
        );
        when(userLogic.getAll()).thenReturn(users);

        List<User> result = controller.getUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).username()).isEqualTo("user1");
        verify(userLogic).getAll();
    }
    @Test
    public void getAllEvents_returnsAllEvents() {
        List<Event> events = List.of(dummyEvent);


        when(eventLogic.getAllEvents()).thenReturn(events);

        List<Event> result = controller.getAllEvents();

        assertThat(result).hasSize(1);
        verify(eventLogic).getAllEvents();
    }
    @Test
    public void getEvent_validId_returnsMatchingEvent() {

        List<Event> events = List.of(dummyEvent);

        when(eventLogic.getAllEvents()).thenReturn(events);

        Event result = controller.getEvent(1);

        assertThat(result).isEqualTo(events.get(0));
    }
    @Test
    public void createEvent_validEvent_returnsOkResponse() throws BusinessLogicException {

        when(eventLogic.createEvent(dummyEvent)).thenReturn(dummyEvent);

        ResponseEntity<?> response = controller.createEvent(dummyEvent);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(dummyEvent);
        verify(eventLogic).createEvent(dummyEvent);
    }
}
