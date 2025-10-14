import emp.Main;

public class MainProg {
    public static void main(String[] args) {
        try{
            Main.main(args);
        }
        catch(Exception e){
            System.out.println("The program caught an exception");
        }
    }
}
