import React, { useState, useEffect } from 'react';
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
    InputAdornment,
    useMediaQuery,
    useTheme,
    Typography,
    Card,
    CardContent,
    Divider,
    Stack
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
    
    // Usar theme y mediaQuery para detectar tamaño de pantalla
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

    // Renderizar vista de tarjetas para móviles
    const renderMobileCards = () => {
        return sortAndFilterData()
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
                <Card 
                    key={index} 
                    sx={{ 
                        mb: 2, 
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                            {columns.map((column, colIndex) => {
                                // Omitir columna de ID en vista móvil para ahorrar espacio
                                if (column.id === 'id' && isMobile) return null;
                                
                                const value = row[column.id];
                                return (
                                    <Box key={colIndex}>
                                        {column.id !== 'acciones' && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    fontFamily: 'DM Sans', 
                                                    fontWeight: 600,
                                                    color: '#666',
                                                    display: 'block'
                                                }}
                                            >
                                                {column.label}
                                            </Typography>
                                        )}
                                        <Box sx={{ 
                                            mt: 0.5, 
                                            display: 'flex',
                                            justifyContent: column.id === 'acciones' ? 'flex-end' : 'flex-start'
                                        }}>
                                            {column.render ? column.render(value, row) : (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontFamily: 'DM Sans',
                                                        fontWeight: 400
                                                    }}
                                                >
                                                    {value}
                                                </Typography>
                                            )}
                                        </Box>
                                        {colIndex < columns.length - 1 && column.id !== 'acciones' && (
                                            <Divider sx={{ mt: 1.5 }} />
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </CardContent>
                </Card>
            ));
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

            {/* Vista de tabla para escritorio o vista de tarjetas para móvil */}
            {isMobile ? (
                <Box sx={{ p: 2 }}>
                    {renderMobileCards()}
                </Box>
            ) : (
                <TableContainer sx={{ 
                    maxWidth: '100%', 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#E6EDF0',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#FB8500',
                    }
                }}>
                    <Table stickyHeader sx={{ 
                        tableLayout: isTablet ? 'auto' : 'fixed', 
                        width: '100%' 
                    }}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        style={{ 
                                            width: isTablet ? 'auto' : (column.width || 'auto'),
                                            maxWidth: column.maxWidth || 'none',
                                            minWidth: isTablet ? (column.minWidth || '100px') : 'auto',
                                            fontFamily: 'DM Sans',
                                            fontWeight: 600,
                                            fontSize: isTablet ? '14px' : '15px',
                                            color: '#000000',
                                            backgroundColor: '#FFFFFF',
                                            cursor: column.id !== 'acciones' ? 'pointer' : 'default',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            padding: isTablet ? '10px' : '16px'
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
                                                        fontSize: isTablet ? '13px' : '14px',
                                                        color: '#000000',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        padding: isTablet ? '10px' : '16px'
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
            )}

            {/* Paginación */}
            <TablePagination
                rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
                component="div"
                count={sortAndFilterData().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
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
                        display: isMobile ? 'none' : 'block'
                    }
                }}
            />
        </Paper>
    );
};

export default DataTable;
