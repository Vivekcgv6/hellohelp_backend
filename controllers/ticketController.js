const { createTicket, getTicketsByUser } = require('../models/ticketModel');

exports.addTicket = async (req, res) => {
  const { type, message } = req.body;
  try {
    const ticket = await createTicket(req.user.userId, type, message);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await getTicketsByUser(req.user.userId);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
