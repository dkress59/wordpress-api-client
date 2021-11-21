export const mockStatusText = 'Mock Server Error'

export const mockResponse = (error: unknown) => {
	return {
		json: () => error,
		text: () => String(error),
		status: 666,
		statusText: mockStatusText,
	} as unknown as Response
}
