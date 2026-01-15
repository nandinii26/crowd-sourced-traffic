import { Router } from 'express';
import { sendMessage } from '../kafka/producer';

const router = Router();

router.post('/', async (req, res) => {
  const payload = req.body;
  // validate and anonymization must be applied client-side and verified here
    try {
      await sendMessage('raw-events', [{ value: JSON.stringify(payload) }]);
      return res.status(202).send({ status: 'accepted' });
    } catch (err) {
      console.error('ingest error', err);
      return res.status(500).send({ error: 'ingest_failed' });
    }
});

export default router;
