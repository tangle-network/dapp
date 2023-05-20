import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionContent,
  Typography,
} from '@webb-tools/webb-ui-components';

const faqItems = [
  {
    question: 'What is the Tangle Token (TNT) and what is it used for?',
    answer:
      'The TNT token refers to the native cryptocurrency of the Tangle network. The TNT token serves several key purposes within the Tangle ecosystem:' +
      '\n\n' +
      '• Governance: TNT token holders can participate in the governance of the Tangle network by proposing or voting on changes to the protocol, system upgrades, and other improvements. This ensures that decision-making power is decentralized and distributed among stakeholders.' +
      '\n\n' +
      '• Staking: TNT tokens can be staked by validators and nominators to help secure the network. Validators are responsible for validating and producing new blocks, while nominators support validators by selecting them and staking their TNT tokens as a form of backing. Staking helps maintain network security and integrity, and those who participate in staking are rewarded with additional TNT tokens as an incentive.',
  },
  {
    question: 'How are validator rewards calculated',
    answer:
      'The validator rewards are paid out every block, the rewards consists of multiple components:' +
      '\n\n' +
      '(1) Transaction fees from all transactions in the block' +
      '\n' +
      '(2) Tips paid by users' +
      '\n' +
      '(3) Network reward amount' +
      '\n\n' +
      'The validator reward is initially paid out from the validator reward pot allotted at the time of genesis. Once the initial genesis supply for validator rewards has been exhausted, the network will issue new amount of currency (at a predetermined rate of inflation) every block to continue rewarding the validator.',
  },
  {
    question: 'Can anyone run a validator and a relayer? ',
    answer:
      'Yes! Well perhaps, not immediately at launch but we intend to make the Tangle network and greater Webb ecosystem accessible to everyone. We will be announcing programs to incrementally onboard additional network participants. Subscribe to the newsletter so you don’t miss out!',
  },
];

export const FAQSection = () => {
  return (
    <section className="bg-mono-0 py-20 px-5 lg:flex lg:flex-col lg:items-center">
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col items-center mb-9">
          <Typography
            variant="mkt-small-caps"
            className="text-center pb-2 text-purple-70 font-black"
          >
            Learn More
          </Typography>
          <Typography
            variant="mkt-h3"
            className="pb-4 font-black text-mono-200"
          >
            Frequently asked questions
          </Typography>
          <Typography
            variant="mkt-body1"
            className="text-center font-medium text-mono-140"
          >
            Need more information? Explore our documentation site or connect
            with others in our community channels to learn more!
          </Typography>
        </div>
        <Accordion
          defaultValue={[faqItems[0].question]}
          type="multiple"
          className="lg:mx-auto"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={item.question}
              className="border-b border-mono-40 px-0"
            >
              <AccordionButton className="px-0 gap-8 items-start">
                <Typography
                  variant="mkt-body1"
                  className="font-black text-mono-200"
                >
                  {item.question}
                </Typography>
              </AccordionButton>
              <AccordionContent className="px-0 pr-[52.5px]">
                <Typography
                  variant="mkt-body1"
                  className="font-medium text-mono-160 whitespace-pre-line"
                >
                  {item.answer}
                </Typography>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
