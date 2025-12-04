import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string;
    firstName: string;
    lastName?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
};

export default function Avatar({
    src,
    firstName,
    lastName,
    size = "md",
    className,
}: AvatarProps) {
    const initials = getInitials(firstName, lastName);

    return (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-400 text-white font-semibold overflow-hidden flex-shrink-0",
                sizeClasses[size],
                className
            )}
        >
            {src ? (
                <Image
                    src={src}
                    alt={`${firstName} ${lastName || ""}`.trim()}
                    fill
                    className="object-cover"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
