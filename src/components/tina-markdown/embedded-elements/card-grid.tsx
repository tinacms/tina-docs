import Link from "next/link";

export const CardGrid = (data: {
  cards: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  }[];
}) => {
  return (
    <div className="my-8 grid grid-cols-1 rounded-lg gap-4 lg:grid-cols-2">
      {data.cards?.map((card, index) => {
        if (card.link) {
          return (
            <Link
              href={card.link}
              className="bg-neutral-background/75 rounded-lg group p-6  shadow-lg hover:bg-gradient-to-br hover:from-transparent hover:via-seafoam/25 hover:to-seafoam transition-all duration-300"
              key={`card-${index}-${card.title}`}
            >
              <h2 className="font-tuner text-3xl font-medium brand-primary-gradient mb-2">
                {card.title}
              </h2>
              <p className="text-neutral-text mb-4">{card.description}</p>
              {card.link && (
                <p className="font-tuner flex items-center">
                  <span className="relative brand-secondary-gradient">
                    {card.linkText ?? "See more"}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-grayblue/80 to-deepblue group-hover:w-full transition-all duration-300 ease-in-out" />
                  </span>
                  <span className="ml-1 brand-secondary-gradient"> ›</span>
                </p>
              )}
            </Link>
          );
        }
        return (
          <div
            className="bg-neutral-background/75 rounded-lg p-6 shadow-lg hover:bg-gradient-to-br hover:from-transparent hover:via-seafoam/25 hover:to-seafoam transition-all duration-300"
            key={`card-${index}-${card.title}`}
          >
            <h2 className="font-tuner text-3xl font-medium brand-primary-gradient mb-2">
              {card.title}
            </h2>
            <p className="text-neutral-text mb-4">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};
