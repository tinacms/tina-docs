import Link from "next/link";
import { Actions } from "../../blocks/action-button/actions-button";

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
              className="bg-white rounded-lg group p-6 shadow-sm hover:bg-gradient-to-br hover:from-transparent hover:via-seafoam/25 hover:to-seafoam transition-all duration-300"
              key={`card-${index}-${card.title}`}
            >
              <h2 className="font-tuner text-3xl font-medium bg-gradient-to-r from-ochre-600 to-ochre-800 bg-clip-text text-transparent mb-2">
                {card.title}
              </h2>
              <p className="text-gray-800 mb-4">{card.description}</p>
              {card.link && (
                <p className="font-tuner flex items-center">
                  <span className="relative bg-gradient-to-r from-grayblue/80 to-deepblue bg-clip-text text-transparent">
                    {card.linkText ?? "See more"}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-grayblue/80 to-deepblue group-hover:w-full transition-all duration-300 ease-in-out" />
                  </span>
                  <span className="ml-1 text-deepblue"> ›</span>
                </p>
              )}
            </Link>
          );
        }
        return (
          <div
            className="bg-white rounded-lg p-6 shadow-sm hover:bg-gradient-to-br hover:from-transparent hover:via-seafoam/25 hover:to-seafoam transition-all duration-300"
            key={`card-${index}-${card.title}`}
          >
            <h2 className="font-tuner text-3xl font-medium bg-gradient-to-r from-ochre-600 to-ochre-800 bg-clip-text text-transparent mb-2">
              {card.title}
            </h2>
            <p className="text-gray-800 mb-4">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};
