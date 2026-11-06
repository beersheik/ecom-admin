import React, { useState } from 'react';
import {
  Box, Paper, Stack, Typography, Divider, Collapse, IconButton, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  useTheme, useMediaQuery
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// A table on wide screens; one card per row below `cardsBelow` (default: tablets and phones),
// so nothing scrolls sideways. Wide tables can pass cardsBelow="lg" or a pixel width.
//
// columns: [{ label, render(row, index), align, primary, hideOnMobile, cellSx }]
//   primary      — shown as the card's title on phones (no label)
//   hideOnMobile — left out of the phone card (e.g. a logo shown in the title instead)
//   hideOnDesktop — only in the phone card (e.g. a combined image + name title)
// actions(row)  — buttons; last column on desktop, bottom of the card on phones
// expand(row)   — optional details; an expandable row on desktop, a "Details" toggle on phones
export default function ResponsiveTable({ columns: allColumns, rows, rowKey = (row) => row._id, actions, expand, headSx, size = 'small', cardsBelow = 'md' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(cardsBelow));
  const columns = isMobile ? allColumns.filter(c => !c.hideOnMobile) : allColumns.filter(c => !c.hideOnDesktop);

  if (isMobile) {
    return (
      <Box sx={{ p: 1.5, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, alignItems: 'start' }}>
        {rows.map((row, i) => <MobileCard key={rowKey(row, i)} row={row} index={i} columns={columns} actions={actions} expand={expand} />)}
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size={size}>
        <TableHead>
          <TableRow sx={headSx}>
            {expand && <TableCell sx={{ width: 48 }} />}
            {columns.map((col, c) => <TableCell key={c} align={col.align}>{col.label}</TableCell>)}
            {actions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <DesktopRow key={rowKey(row, i)} row={row} index={i} columns={columns} actions={actions} expand={expand} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function DesktopRow({ row, index, columns, actions, expand }) {
  const [open, setOpen] = useState(false);
  const span = columns.length + (actions ? 1 : 0) + 1;
  return (
    <>
      <TableRow hover sx={expand ? { '& > *': { borderBottom: 'unset' } } : undefined}>
        {expand && (
          <TableCell>
            <IconButton size="small" onClick={() => setOpen(o => !o)} aria-label={open ? 'Hide details' : 'Show details'}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        )}
        {columns.map((col, c) => <TableCell key={c} align={col.align} sx={col.cellSx}>{col.render(row, index)}</TableCell>)}
        {actions && <TableCell align="right">{actions(row, index)}</TableCell>}
      </TableRow>
      {expand && (
        <TableRow>
          <TableCell colSpan={span} sx={{ py: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>{expand(row, index)}</Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function MobileCard({ row, index, columns, actions, expand }) {
  const [open, setOpen] = useState(false);
  const primary = columns.filter(c => c.primary);
  const rest = columns.filter(c => !c.primary);
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 1.5 }}>
        {primary.map((col, c) => (
          <Box key={c} sx={{ fontWeight: 600, mb: 1, overflowWrap: 'anywhere' }}>{col.render(row, index)}</Box>
        ))}
        <Stack spacing={0.75}>
          {rest.map((col, c) => (
            <Box key={c} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, pt: '2px' }}>{col.label}</Typography>
              <Box sx={{ textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere', fontSize: 14 }}>{col.render(row, index)}</Box>
            </Box>
          ))}
        </Stack>
      </Box>
      {(actions || expand) && (
        <>
          <Divider />
          <Box sx={{ px: 1, py: 0.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
            {expand && (
              <Button size="small" color="inherit" onClick={() => setOpen(o => !o)} endIcon={open ? <KeyboardArrowUp /> : <KeyboardArrowDown />} sx={{ mr: 'auto' }}>
                {open ? 'Hide details' : 'Details'}
              </Button>
            )}
            {actions && <Box sx={{ ml: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5 }}>{actions(row, index)}</Box>}
          </Box>
        </>
      )}
      {expand && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ px: 1.5, pb: 1.5 }}>{expand(row, index)}</Box>
        </Collapse>
      )}
    </Paper>
  );
}
