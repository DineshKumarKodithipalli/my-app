import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Container, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DogImage from '../Fetch.png'
const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: theme.spacing(8),
    },
    dogImage: {
        marginRight: theme.spacing(2),
        width: '130px',
        height: '100px',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
        
    },
    submitButton: {
        margin: theme.spacing(3, 0, 2),
    },
    header: {
        marginBottom: theme.spacing(3),
    },
}));

const Login: React.FC = () => {
    const classes = useStyles();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'https://frontend-take-home-service.fetch.com/auth/login',
                {
                    name,
                    email,
                },
                {
                    withCredentials: true, // Send cookies with the request
                }
            );
            if (response.status === 200) {
                // Redirect to the search page
                navigate('/search');
            }

            console.log(response.data); // Handle the response data as needed
            // Assuming the authentication cookie is automatically stored by the browser,
            // you can proceed with accessing other authenticated endpoints.
            // Perform any necessary redirect or state update to navigate to the authenticated area.
        } catch (error) {
            console.error(error);
            // Handle any login error, display error message, etc.
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.container}>
                <img src={DogImage} alt="Dog" className={classes.dogImage} />
                <Typography style={{ color: '#7d1f70' }} component="h1" variant="h4">
                    FETCH YOUR DOG!!
                </Typography>
                <Divider  style={{width: '400px'}}/>
                <Typography style={{ color: '#7d1f70' }} component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form} onSubmit={handleLogin}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        className={classes.submitButton}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                    >
                        Login
                    </Button>
                </form>
            </div>
        </Container>
    );
};

export default Login;
