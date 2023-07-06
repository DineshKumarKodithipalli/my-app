import React, { useState, useEffect, MouseEvent } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { Dialog, DialogTitle, DialogContent, Typography } from '@material-ui/core';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    FormControl,
    InputLabel,
    TextField,
    TextareaAutosize,
    Card,
    CardMedia
} from '@material-ui/core';

interface Dog {
    id: string;
    breed: string;
    name: string;
    age: number;
    zip_code: string;
    img: string;
}
interface Match {
    match: string;
}
interface Location {
    zip_code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    county: string;
}
const apiInstance = axios.create({
    baseURL: 'https://frontend-take-home-service.fetch.com',
    withCredentials: true,
});
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2),
    },
    formControl: {
        marginBottom: theme.spacing(2),
        minWidth: 200,
    },
    tableContainer: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        borderCollapse: 'collapse',
    },
    tableHeader: {
        fontWeight: 'bold',
        border: '1px solid black',
        padding: theme.spacing(1),
    },
    tableRow: {
        '&:nth-of-type(even)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    tableCell: {
        border: '1px solid black',
        padding: theme.spacing(1),
    },
    buttonGroup: {
        '& > *': {
            marginRight: theme.spacing(2),
            marginBottom: theme.spacing(3)
        },
    },
}));
const SearchPage: React.FC = () => {
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
    const [zipCodes, setZipCodes] = useState<string[]>([]);
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [resultIds, setResultIds] = useState<string[]>([]);
    const [dogDetails, setDogDetails] = useState<Dog[]>([]);
    const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
    const [next, setNext] = useState('');
    const [prev, setPrev] = useState('');
    const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
    const [location, setLocation] = useState<Location | null>(null);
    const classes = useStyles();
    useEffect(() => {
        fetchBreeds();
        handleSearch();
    }, []);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, dogId: string) => {
        const { checked } = event.target;

        if (checked) {
            setSelectedDogIds((prevSelectedDogIds) => [...prevSelectedDogIds, dogId]);
        } else {
            setSelectedDogIds((prevSelectedDogIds) =>
                prevSelectedDogIds.filter((id) => id !== dogId)
            );
        }
    };
    const fetchBreeds = async () => {
        try {
            const response = await apiInstance.get('/dogs/breeds');
            const breedsData = response.data;
            setBreeds(breedsData);
        } catch (error) {
            console.error(error);
            // Handle error fetching breeds data
        }
    };

    const handleSearch = async () => {
        try {
            const queryParams: {
                breeds?: string[];
                zipCodes?: string[];
                ageMin?: string;
                ageMax?: string;
            } = {};


            if (selectedBreeds.length > 0) {
                queryParams.breeds = selectedBreeds;
            }
            if (zipCodes.length > 0) {
                queryParams.zipCodes = zipCodes;
            }
            if (minAge !== '') {
                queryParams.ageMin = minAge;
            }
            if (maxAge !== '') {
                queryParams.ageMax = maxAge;
            }
            const response = await apiInstance.get('/dogs/search', {
                params: queryParams,
            }
            );
            const responseData = response.data;

            setResultIds(responseData.resultIds);
            setNext(responseData.next);
            setPrev(responseData.prev);
            handleGetDetails(responseData.resultIds);
        } catch (error) {
            console.error(error);
            // Handle error fetching dog search results
        }
    };

    const handleGetDetails = async (resultIds: string[]) => {
        try {
            const response = await apiInstance.post('/dogs', resultIds);
            const dogDetailsData = response.data;
            setDogDetails(dogDetailsData);
        } catch (error) {
            console.error(error);
        }
    };
    const handleBreedChange = (event: React.ChangeEvent<{}>, value: string[]) => {
        setSelectedBreeds(value);
    };
    const handleZipCodesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const enteredZipCodes = event.target.value.trim().split('\n');
        setZipCodes(enteredZipCodes);
    };
    const handlePagination = async (url: string) => {
        try {
            const response = await apiInstance.get(url);
            const responseData = response.data;

            setResultIds(responseData.resultIds);
            setNext(responseData.next);
            setPrev(responseData.prev);

            handleGetDetails(responseData.resultIds);
        } catch (error) {
            console.error(error);
        }
    };
    const handleMatch = async (dogIds: string[]) => {
        try {
            const response = await apiInstance.post('/dogs/match', dogIds);
            const dogData = response.data;
            const dogResponse = await apiInstance.post('/dogs', [dogData.match]);
            const dogDetailsData = dogResponse.data;
            setMatchedDog(dogDetailsData[0])
            const locResponse = await apiInstance.post('/locations', [dogDetailsData[0].zip_code]);
            const locationData = locResponse.data;
            console.log(locationData[0])
            setLocation(locationData[0])
        } catch (error) {
            console.error(error);
        }
    };
    console.log(matchedDog)
    const handleCloseOverlay = () => {
        setMatchedDog(null);
    };
    interface DogMatchProps {
        matchedDog: Dog;
        location: Location;
        onClose: () => void;
    }

    const DogMatch: React.FC<DogMatchProps> = ({ matchedDog, location, onClose }) => {
        console.log(matchedDog)
        console.log(location)
        const handleDialogClose = () => {
            onClose();
        };
        return (
            <Dialog open={!!matchedDog} onClose={handleDialogClose}>
                <DialogTitle>Match Details</DialogTitle>
                <DialogContent>
                    <Card key={matchedDog.id} style={{ marginBottom: '16px' }}>
                        <CardMedia component="img" src={matchedDog.img} alt={matchedDog.name} />
                        <div>
                            <Typography>Matched Dog: {matchedDog.name}</Typography>
                            <Typography>Age: {matchedDog.age}</Typography>
                            <Typography>City: {location.city}</Typography>
                            <Typography>County: {location.county}</Typography>
                            <Typography>State: {location.state}</Typography>
                            <Typography>Zipcode: {matchedDog.zip_code}</Typography>
                        </div>
                    </Card>
                    <Button variant="contained" color="primary" onClick={handleDialogClose}>
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        );
    };
    return (
        <div className={classes.root}>
            <h2 style={{ color: '#7d1f70' }}>Search</h2>
            <FormControl className={classes.formControl}>
                <Autocomplete
                    multiple
                    options={breeds}
                    value={selectedBreeds}
                    onChange={handleBreedChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Search Breeds"
                            placeholder="Type to search"
                        />
                    )}
                />
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel>Zip Code</InputLabel>
                <TextareaAutosize
                    rowsMin={3}
                    value={zipCodes.join('\n')}
                    onChange={handleZipCodesChange}
                />
            </FormControl>
            <FormControl className={classes.formControl}>
                <TextField
                    label="Min Age"
                    type="text"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                />
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleSearch}>
                Search
            </Button>


            <Table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <TableHead>
                    <TableRow>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}></TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>Image</TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>Name</TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>Age</TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>Breed</TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>Zip Code</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dogDetails.map((dog) => (
                        <TableRow key={dog.id}>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedDogIds.includes(dog.id)}
                                    onChange={(event) => handleCheckboxChange(event, dog.id)}
                                />
                            </TableCell>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>
                                <img src={dog.img} alt={dog.name} style={{ width: '100px', height: '100px' }} />
                            </TableCell>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>{dog.name}</TableCell>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>{dog.age}</TableCell>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>{dog.breed}</TableCell>
                            <TableCell style={{ border: '1px solid black', padding: '8px' }}>{dog.zip_code}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>
                {prev && (
                    <Button onClick={() => handlePagination(prev)}>Previous</Button>
                )}
                {next && (
                    <Button onClick={() => handlePagination(next)}>Next</Button>
                )}
            </div>
            <div>
                {selectedDogIds && (
                    <Button onClick={() => handleMatch(selectedDogIds)}>Match</Button>
                )}
            </div>
            {matchedDog && location && (
                <DogMatch matchedDog={matchedDog} location={location} onClose={handleCloseOverlay} />
            )}
        </div>


    );
};
export default SearchPage;
