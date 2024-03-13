import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import {Box, Button, Select, MenuItem } from '@mui/material';

export default function StatsExample() {
    //const [events, setEvents] = useState([]);

    const dummyData = [
        {name: 'Page A', lotacao: 4000, numero_inscritos: 2400, presentes: 2400},
        {name: 'Page B', lotacao: 3000, numero_inscritos: 1398, presentes: 2210},
        {name: 'Page C', lotacao: 2000, numero_inscritos: 9800, presentes: 2290},
    ];

    return(
        <div>
        <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        flexDirection="column"
        >
        <LineChart width={800} height={500} data={dummyData}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
            <Legend />
            <Tooltip />
            <Line type="natural" dataKey="lotacao" stroke="#ACC3A6" name="Lotação"/>
            <Line type="natural" dataKey="numero_inscritos" stroke="#3772FF" name="Número Inscritos"/>
            <Line type="natural" dataKey="presentes" stroke="#EC058E" name="Presentes"/>
        </LineChart>
        {/*<Button onClick={handleButtonClick} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Carregar Estatísticas
                </Button>*/}
        </Box>
        </div>
    )


}