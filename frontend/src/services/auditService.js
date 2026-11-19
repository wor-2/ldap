import api from './api';

const auditService = {
  getLogs: (page = 0, size = 20, search) =>
    api.get('/audit', {
      params: {
        page,
        size,
        ...(search ? { search } : {}),
      },
    }),
};

export default auditService;
