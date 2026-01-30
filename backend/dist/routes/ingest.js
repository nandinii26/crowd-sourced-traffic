"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const producer_1 = require("../kafka/producer");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const payload = req.body;
    // validate and anonymization must be applied client-side and verified here
    try {
        await (0, producer_1.sendMessage)('raw-events', [{ value: JSON.stringify(payload) }]);
        return res.status(202).send({ status: 'accepted' });
    }
    catch (err) {
        console.error('ingest error', err);
        return res.status(500).send({ error: 'ingest_failed' });
    }
});
exports.default = router;
