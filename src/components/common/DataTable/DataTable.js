import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    Box,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const DataTable = ({ columns, data, searchPlaceholder = "Buscar..." }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('');
    const [orderDirection, setOrderDirection] = useState('asc');

    // Ordenar y filtrar datos
    const sortAndFilterData = () => {
        let filteredData = data.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        if (orderBy) {
            filteredData.sort((a, b) => {
                let valueA = a[orderBy];
                let valueB = b[orderBy];

                // Convertir a minúsculas si son strings
                if (typeof valueA === 'string') valueA = valueA.toLowerCase();
                if (typeof valueB === 'string') valueB = valueB.toLowerCase();

                if (valueA < valueB) return orderDirection === 'asc' ? -1 : 1;
                if (valueA > valueB) return orderDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredData;
    };

    // Manejar cambio de página
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Manejar cambio de filas por página
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Manejar cambio en la búsqueda
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // Manejar cambio en el ordenamiento
    const handleSort = (columnId) => {
        const isAsc = orderBy === columnId && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(columnId);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            {/* Barra de búsqueda */}
            <Box sx={{ p: 2, bgcolor: '#FFFFFF' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#E6EDF0',
                            },
                            '&:hover fieldset': {
                                borderColor: '#FB8500',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#FB8500',
                            },
                        },
                    }}
                />
            </Box>

            {/* Tabla */}
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ 
                                        width: column.width || 'auto',
                                        maxWidth: column.maxWidth || 'none',
                                        fontFamily: 'DM Sans',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        color: '#000000',
                                        backgroundColor: '#FFFFFF',
                                        cursor: column.id !== 'acciones' ? 'pointer' : 'default',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    onClick={() => column.id !== 'acciones' && handleSort(column.id)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start' }}>
                                        {column.label}
                                        {orderBy === column.id && (
                                            <Box component="span" sx={{ ml: 1 }}>
                                                {orderDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortAndFilterData()
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <TableRow 
                                    hover 
                                    key={index}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#F8FAFC !important'
                                        }
                                    }}
                                >
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell
                                                key={column.id}
                                                align={column.align || 'left'}
                                                style={{
                                                    fontFamily: 'DM Sans',
                                                    fontSize: '14px',
                                                    color: '#000000',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {column.render ? column.render(value, row) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortAndFilterData().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count}`
                }
                sx={{
                    '.MuiTablePagination-select': {
                        fontFamily: 'DM Sans',
                    },
                    '.MuiTablePagination-displayedRows': {
                        fontFamily: 'DM Sans',
                    },
                    '.MuiTablePagination-selectLabel': {
                        fontFamily: 'DM Sans',
                    }
                }}
            />
        </Paper>
    );
};

export default DataTable;
