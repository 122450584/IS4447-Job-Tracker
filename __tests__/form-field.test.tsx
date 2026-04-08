import { fireEvent, render, screen } from '@testing-library/react-native';

import { FormField } from '@/components/form-field';

describe('FormField', () => {
  it('renders the label and placeholder, then handles text changes', () => {
    const handleChangeText = jest.fn();

    render(
      <FormField
        label="Company"
        onChangeText={handleChangeText}
        placeholder="Enter company name"
        value=""
      />
    );

    expect(screen.getByText('Company')).toBeTruthy();

    const input = screen.getByPlaceholderText('Enter company name');
    fireEvent.changeText(input, 'Acme Software');

    expect(handleChangeText).toHaveBeenCalledWith('Acme Software');
  });
});
