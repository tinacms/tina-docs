import { Actions } from "./action-button/actions-button";

export const CardGrid = (data: {
  cards: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  }[];
}) => {
  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="border-seafoam-300 my-8 grid grid-cols-1 rounded-lg border shadow-lg md:grid-cols-2">
      {data.cards?.map((card, index) => (
        <a
          key={index}
          href={card.link}
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="hover:bg-seafoam-100 group flex flex-col justify-between rounded-lg bg-transparent p-6 transition-all duration-150 ease-out"
        >
          <h2 className="tina-gradient bg-clip-text font-tuner  text-2xl font-bold leading-snug text-transparent transition-all duration-150 ease-out group-hover:from-blue-700 group-hover:via-blue-600 group-hover:to-blue-500">
            {card.title}
          </h2>

          <p className="text-gray-700">{card.description}</p>
          <div className="flex-1" />
          {card.linkText && (
            <Actions
              items={[
                {
                  variant: "secondary",
                  label: card.linkText,
                  icon: "arrowRight",
                  url: card.link,
                },
              ]}
              flush={true}
            />
          )}
        </a>
      ))}
    </div>
  );
};
