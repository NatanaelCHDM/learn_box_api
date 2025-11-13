const axios = require('axios');
const { searchAdresse } = require('../src/services/adresseService');

jest.mock('axios');

describe('adresseService', () => {
  it('should throw error if query missing', async () => {
    await expect(searchAdresse()).rejects.toThrow('Query is required');
  });

  it('should return results from API', async () => {
    const mockData = { features: [{ id: 1, properties: { label: 'Paris' } }] };
    axios.get.mockResolvedValue({ data: mockData });
    const result = await searchAdresse('Paris');
    expect(result).toEqual(mockData.features);
    expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      params: { q: 'Paris', limit: 5 }
    }));
  });

  it('should throw error on axios failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    await expect(searchAdresse('Paris')).rejects.toThrow('Network error');
  });
});
