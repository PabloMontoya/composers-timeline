import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogContent,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./App.css";

const App = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);
      });
  }, []);

  const eras = {
    baroque: { start: 1600, end: 1750 },
    classical: { start: 1750, end: 1820 },
    romantic: { start: 1820, end: 1900 },
    modern: { start: 1900, end: 3000 },
  };

  useEffect(() => {
    let updatedEvents = [...events];
    if (filterText !== "") {
      const filterInput = filterText.toLowerCase();
      if (eras[filterInput]) {
        const { start, end } = eras[filterInput];
        updatedEvents = events.filter(
          (item) => item.year >= start && item.year <= end
        );
      } else {
        updatedEvents = events
          .map((item) => ({
            ...item,
            events: item.events.filter(
              (event) =>
                event.title.toLowerCase().includes(filterText.toLowerCase()) ||
                event.info.toLowerCase().includes(filterText.toLowerCase()) ||
                item.year.toString().includes(filterText)
            ),
          }))
          .filter((item) => item.events.length > 0);
      }
    }

    if (!isAscending) {
      updatedEvents.sort((a, b) => b.year - a.year);
    } else {
      updatedEvents.sort((a, b) => a.year - b.year);
    }

    setFilteredEvents(updatedEvents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText, events, isAscending]);

  const handleEventClick = (event) => {
    setSelectedEvent(selectedEvent === event ? null : event);
  };

  const handleClearFilter = () => {
    setFilterText("");
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        Composers Timeline
      </Typography>
      <Box mb={2} display="flex" alignItems="center">
        <Tooltip
          title="Protip: search by era, e.g., Baroque, Classical, Modern"
          placement="bottom-start"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            className="MuiTextField-root"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip
                    title={`Sort ${isAscending ? "Descending" : "Ascending"}`}
                    placement="left"
                  >
                    <IconButton onClick={toggleSortOrder}>
                      <SortIcon
                        style={{
                          transform: isAscending
                            ? "rotate(0deg)"
                            : "rotate(180deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Clear" placement="right">
                    <IconButton onClick={handleClearFilter}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Tooltip>
      </Box>
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        <TransitionGroup component={null}>
          {filteredEvents.map((item, itemIndex) => (
            <CSSTransition key={item.year} timeout={500} classNames="fade">
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot />
                  {itemIndex !== filteredEvents.length - 1 && (
                    <TimelineConnector />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">{item.year}</Typography>
                  {item.events.map((event, index) => (
                    <Box key={index} mb={4}>
                      <Paper
                        onClick={() => handleEventClick(event)}
                        className={`paper ${
                          selectedEvent === event ? "expanded" : ""
                        }`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: 2,
                          cursor: "pointer",
                          backgroundColor: "#424242",
                          borderColor: "whitesmoke",
                          borderWidth: 2,
                          borderStyle: "solid",
                          flexDirection: { xs: "column", sm: "row" },
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {event.image && (
                          <Avatar
                            src={event.image}
                            variant="circular"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(event.image);
                            }}
                            sx={{
                              width: 100,
                              height: 100,
                              marginRight: { sm: 2, xs: 0 },
                              marginBottom: { xs: 2, sm: 0 },
                              border: "2px solid whitesmoke",
                            }}
                          />
                        )}
                        <Box
                          className="paper-content"
                          sx={{ transition: "all 0.5s ease-in-out" }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              color: "whitesmoke",
                              fontSize: { xs: "1.25rem", sm: "1.5rem" },
                            }}
                          >
                            {event.title}
                          </Typography>
                          <CSSTransition
                            in={selectedEvent === event}
                            timeout={300}
                            classNames="fade"
                            unmountOnExit
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                color: "whitesmoke",
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                              }}
                            >
                              {event.info}
                            </Typography>
                          </CSSTransition>
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </TimelineContent>
              </TimelineItem>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </Timeline>

      <Dialog open={!!selectedImage} onClose={handleCloseDialog}>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Selected Event"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default App;
