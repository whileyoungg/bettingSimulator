package io.persistence;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnect {
    private static String namespace = "jdbc";

    public static Connection getConnection() {
        Connection con = null;
        Properties prop = new Properties();
        try (InputStream dbProperties = DBConnect.class.getClassLoader().getResourceAsStream("db.properties");
             ) {
            prop.load(dbProperties);
            String host = prop.getProperty(namespace + ".host");
            String port = prop.getProperty(namespace + ".port");
            String dbname = prop.getProperty(namespace + ".dbname");
            String schema = prop.getProperty(namespace + ".schema");
            String username = prop.getProperty(namespace + ".username");
            String password = prop.getProperty(namespace + ".password");
            String url = "jdbc:postgresql://" + host + ":" + port + "/" + dbname;

            Properties connectionProps = new Properties();
            connectionProps.setProperty("user", username);
            connectionProps.setProperty("password", password);
            connectionProps.setProperty("currentSchema", schema);

            con = DriverManager.getConnection(url, connectionProps);
        } catch (IOException | SQLException e) {
            e.printStackTrace();
        }
        return con;
    }
}
