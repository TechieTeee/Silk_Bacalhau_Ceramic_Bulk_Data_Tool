import { render, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/index';
import { useOrbis } from '@orbisclub/components';

// Mock the useOrbis hook to simulate its behavior
jest.mock('@orbisclub/components', () => ({
  ...jest.requireActual('@orbisclub/components'),
  useOrbis: jest.fn(),
}));

describe('Home Page', () => {
  it('should load posts and initiate Bacahlau job on successful data upload', async () => {
    const mockOrbis = {
      orbis: {
        api: {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          rpc: jest.fn().mockResolvedValueOnce({ data: [], error: null }), // Mock empty response initially
          // Mock another response for successful data upload
          rpc: jest.fn().mockResolvedValueOnce({ data: [], error: null }), 
        },
      },
      user: null,
    };

    // Mock the useOrbis hook to return mockOrbis
    useOrbis.mockReturnValue(mockOrbis);

    const { getByLabelText, getByText } = render(<Home />);

    // Simulate a file upload event
    fireEvent.change(getByLabelText('Upload Data'), {
      target: {
        files: [new File(['dummy,csv'], 'dummy.csv')],
      },
    });

    // Wait for data upload and Bacahlau job initiation
    await waitFor(() => {
      expect(mockOrbis.api.rpc).toHaveBeenCalledTimes(2); // Ensure the API was called twice
      expect(mockOrbis.api.rpc).toHaveBeenCalledWith('get_ranked_posts', expect.any(Object)); // Ensure the API was called with the correct parameters
    });

    // Verify the success message is displayed
    expect(getByText('Upload successful!')).toBeInTheDocument();
  });
});
