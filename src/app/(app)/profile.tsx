import {ProfileScreen} from "@/screens/app/ProfileScreen";
import {useUser} from "@/context";

export default function Profile() {
    const { userProfile } = useUser()
    console.log("Running testFirebase...")

    return <ProfileScreen userProfile={userProfile ?? undefined} />
}
