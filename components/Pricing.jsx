import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PricingCards() {
  const router = useRouter();

  const [customCreditAmount, setCustomCreditAmount] = useState(0);

  function handleCreditInputChange(e) {
    const inputValue = e.target.value;

    if (validatePositiveInteger(inputValue)) {
      setCustomCreditAmount(inputValue * 0.03);
    } else {
      e.target.value = ''; // Clear input or handle invalid input
    }
  }

  function validatePositiveInteger(value) {
    // Regular expression to check if the value is a positive integer and disallow 'e'
    return /^[0-9]+$/.test(value);
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 2,
      }}
    >
      <ToastContainer /> {/* Add the ToastContainer here */}

      <Card size="lg" variant="outlined">
        <Chip size="sm" variant="outlined" color="neutral">
          BASIC
        </Chip>
        <Typography level="h2">Starter Pack</Typography>
        <Divider inset="none" />
        <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            100 Credits
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Close />
            </ListItemDecorator>
            Auto Refill
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Checking Account
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            API Integration
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            3.00${' '}
            <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
              at 0.03/credit
            </Typography>
          </Typography>
          <Button
            variant="soft"
            color="neutral"
            endDecorator={<KeyboardArrowRight />}
            onClick={() => {
              router.push('stripe/3');
            }}
          >
            Start now
          </Button>
        </CardActions>
      </Card>
      <Card
        size="lg"
        variant="solid"
        color="neutral"
        invertedColors
        sx={{ bgcolor: 'neutral.900' }}
      >
        <Chip size="sm" variant="outlined">
          MOST POPULAR
        </Chip>
        <Typography level="h2">Professional Pack</Typography>
        <Divider inset="none" />
        <List
          size="sm"
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            mx: 'calc(-1 * var(--ListItem-paddingX))',
          }}
        >
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Custom Credit Amount
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Auto Refill
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Checking Account
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            API Integration
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Cancel Anytime
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            <input
              className="credit-input"
              type="number"
              onChange={handleCreditInputChange}
              onKeyDown={(e) => {
                // Prevent 'e', '-', and '.' from being typed
                if (e.key === 'e' || e.key === '-' || e.key === '.') {
                  e.preventDefault();
                }
              }}
              style={{ appearance: 'textfield' }} // Add for cross-browser support
            />

            <Typography textColor="text.tertiary" sx={{ mr: 'auto' }} className="custom-credit">
              {customCreditAmount}$
            </Typography>
          </Typography>
          <Button
            endDecorator={<KeyboardArrowRight />}
            onClick={() => {
              if (customCreditAmount > 0) {
                router.push('stripe/' + customCreditAmount);
              } else {
                // Show toast when customCreditAmount is zero
                toast.error('Please enter a valid credit amount greater than zero.');
              }
            }}
          >
            Start now
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
